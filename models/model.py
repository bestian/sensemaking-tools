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

"""Abstract class to interact with LLMs."""

from abc import ABC, abstractmethod
from typing import TypeVar
from pydantic import BaseModel

# Generic type variable to use as a schema for LLM response, constrained to Pydantic models inheriting from BaseModel.
SchemaType = TypeVar('SchemaType', bound=BaseModel)
# Lists of Pydantic models (can be List[BaseModel] or List[AnyScalarType])
ListSchemaType = TypeVar('ListSchemaType')


class Model(ABC):
    """
    An abstract base class that defines how to interact with models.
    Different implementations that call different LLM APIs will inherit this
    class and provide concrete implementations that follow this structure.
    """
    # The best batch size to use for categorization.
    categorization_batch_size: int = 100

    @abstractmethod
    async def generate_text(self, prompt: str) -> str:
        """
        Abstract method for generating a text response based on the given prompt.
        Args:
            prompt: The instructions and data to process as a prompt.
        Returns:
            The model response as a string.
        """
        pass

    @abstractmethod
    async def generate_data(
            self, prompt: str, schema: type[SchemaType] | type[ListSchemaType]
    ) -> SchemaType | ListSchemaType:
        """
        Abstract method for generating structured data based on the given prompt.
        Args:
            prompt: The instructions and data to process as a prompt.
            schema: The Pydantic model (or a list of Pydantic models/scalars)
                    to use for parsing and validating the structured data.
        Returns:
            The model response parsed as an instance of the schema.
        """
        pass
