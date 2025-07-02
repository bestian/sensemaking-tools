# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import asyncio
import logging
import json
from typing import Any, List, Callable
import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    HarmBlockThreshold,
    HarmCategory,
)
import google.auth
from google.auth.transport.requests import Request as AuthRequest
from requests.adapters import HTTPAdapter
import requests


DEFAULT_VERTEX_PARALLELISM = 100  # number of concurrent LLM calls.
MAX_LLM_RETRIES = 3
RETRY_DELAY_SEC = 10

class VertexModel:
    def __init__(
            self,
            project: str,
            location: str,
            model_name: str,
    ):
        creds = custom_pool_creds()

        vertexai.init(project=project, location=location, credentials=creds)

        self.llm = GenerativeModel(
            model_name=model_name,
            generation_config={
                # Param docs: http://cloud/vertex-ai/generative-ai/docs/model-reference/inference#generationconfig
                "temperature": 0,
                "top_p": 0,
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_UNSPECIFIED: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY: HarmBlockThreshold.BLOCK_NONE,
            },
        )

    async def generate_text(self, prompt: str) -> str:
        return await self.call_llm(prompt, self.llm)

    async def generate_data(self, prompt: str) -> Any:
        response_text = await self.call_llm(prompt, self.llm)

        # Drop markdown code block delimiters if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]  # Remove ```json
        if response_text.endswith("```"):
            response_text = response_text[:-3]  # Remove ```

        try:
            response = json.loads(response_text)
        except json.JSONDecodeError as e:
            raise ValueError(f"Model returned invalid JSON: {response_text}") from e

        return response

    async def call_llm(self, prompt: str, model: GenerativeModel) -> str:

        async def call_llm_inner():
            return await model.generate_content_async(prompt)

        def validate_response(response) -> bool:
            if not response:
                logging.error("Failed to get a model response.")
                return False

            if not response.candidates or not response.candidates[0].content.parts or not response.candidates[0].content.parts[0].text:
                logging.error(f"Model returned an incomplete response: {response}")
                return False

            logging.info(
                f"✓ Completed LLM call (input: {response.usage_metadata.prompt_token_count} tokens, output: {response.usage_metadata.candidates_token_count} tokens)"
            )
            return True

        result = await retry_call(
            call_llm_inner,
            validate_response,
            MAX_LLM_RETRIES,
            "Failed to get a valid model response.",
            RETRY_DELAY_SEC,
        )
        return result.text

async def retry_call(
        func,
        validator,
        max_retries,
        error_message,
        retry_delay_sec,
        func_args=None,
        validator_args=None,
):
    func_args = func_args or []
    validator_args = validator_args or []
    backoff_growth_rate = 2.5  # Controls how quickly delay increases b/w retries

    for attempt in range(1, max_retries + 1):
        try:
            response = await func(*func_args)

            if validator(response, *validator_args):
                return response

            logging.error(f"Attempt {attempt} failed. Invalid response: {response}")
        except Exception as error:
            logging.error(f"Attempt {attempt} failed: {error}")

        # Exponential backoff calculation
        delay = retry_delay_sec * (backoff_growth_rate ** (attempt - 1))
        logging.info(f"Retrying in {delay} seconds (attempt {attempt})")
        await asyncio.sleep(delay)

    raise Exception(f"Failed after {max_retries} attempts: {error_message}")

async def run_tasks_in_parallel(
        items: List[Any],
        func: Callable,
        limit: int = DEFAULT_VERTEX_PARALLELISM,
        *args,
        **kwargs,
) -> List[Any]:
    semaphore = asyncio.Semaphore(limit) # Controls concurrency

    async def limited_task(item):
        async with semaphore:
            return await func(item, *args, **kwargs)

    logging.info(f"Running {limit} evaluation tasks in parallel...")
    tasks = [limited_task(item) for item in items]
    results = await asyncio.gather(*tasks)
    return results

def custom_pool_creds():
    # By default, GCP uses connection pool of size 10, we need to override it to support higher concurrency.
    # Create a session that holds up to 100 connections using a custom adaptor
    session = requests.Session()
    adapter = HTTPAdapter(
        pool_connections=DEFAULT_VERTEX_PARALLELISM,  # number of connection pools to cache
        pool_maxsize=DEFAULT_VERTEX_PARALLELISM,  # max connections per pool
        max_retries=MAX_LLM_RETRIES,
        pool_block=True  # block when no free connections
    )
    session.mount("https://", adapter)
    # Build a google‑auth request using that session
    auth_request = AuthRequest(session=session)
    # Retrieve app-default creds and refresh them with the new settings
    creds, _ = google.auth.default()
    creds.refresh(auth_request)  # primes the pool
    return creds
