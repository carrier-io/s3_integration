from typing import Union, Optional
from pydantic import BaseModel, validator
from urllib.parse import urlparse
import boto3

from ...integrations.models.pd.integration import SecretField
from pylon.core.tools import log


class IntegrationModel(BaseModel):
    access_key: str
    secret_access_key: Union[SecretField, str]
    region_name: str
    use_compatible_storage: bool = False
    storage_url: str = ''

    @validator('storage_url')
    def url_validator(cls, value: str):
        if value == '':
            return value
        result = urlparse(value)
        assert all([result.scheme, result.netloc]), 'invalid or missing URL scheme'
        return value

    def check_connection(self) -> bool:
        from tools import session_project
        secret_access_key = self.secret_access_key.unsecret(session_project.get())
        aws_kwargs = {
            'aws_access_key_id': self.access_key,
            'aws_secret_access_key': secret_access_key,
            'region_name': self.region_name
        }
        if self.use_compatible_storage and self.storage_url:
            aws_kwargs.update({'endpoint_url': self.storage_url})
        s3 = boto3.client('s3', **aws_kwargs)
        try:
            s3.list_buckets()
        except Exception as e:
            log.error(e)
            return False
        return True
    

class SecurityTestModel(BaseModel):
    integration_id: int
    is_local: bool

class PerformanceBackendTestModel(SecurityTestModel):
    ...

class PerformanceUiTestModel(SecurityTestModel):
    ...
