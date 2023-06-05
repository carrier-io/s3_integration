from typing import Optional
from pylon.core.tools import log
from pylon.core.tools import web
from pydantic import ValidationError

from ..models.integration_pd import SecurityTestModel

from tools import rpc_tools


class RPC:
    integration_name = 's3_integration'

    @web.rpc(f'dusty_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)    
    def make_dusty_config(self, context, test_params, scanner_params):
        """ Prepare execution_json for this integration """
        return "s3_integration", scanner_params

    @web.rpc(f'security_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def security_test_create_integration_validate(self, data: dict, pd_kwargs: Optional[dict] = None, **kwargs) -> dict:
        if not pd_kwargs:
            pd_kwargs = {}
        pd_object = SecurityTestModel(**data)
        return pd_object.dict(**pd_kwargs)
