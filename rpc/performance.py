import json
from typing import Optional
from pylon.core.tools import log
from pylon.core.tools import web
from pydantic import ValidationError

from ..models.integration_pd import PerformanceBackendTestModel, PerformanceUiTestModel

from tools import rpc_tools


class RPC:
    integration_name = 's3_integration'

    @web.rpc(f'backend_performance_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def backend_performance_test_create_integration_validate(
        self, data: dict,  pd_kwargs: Optional[dict] = None, **kwargs
        ) -> dict:
        if not pd_kwargs:
            pd_kwargs = {}
        pd_object = PerformanceBackendTestModel(**data)
        return pd_object.dict(**pd_kwargs)

    @web.rpc(f'backend_performance_execution_json_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def backend_make_execution_json_config(self, integration_data: dict) -> dict:
        """ Prepare execution_json for this integration """
        return integration_data

    @web.rpc(f'ui_performance_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def ui_performance_test_create_integration_validate(
        self, data: dict, pd_kwargs: Optional[dict] = None, **kwargs
        ) -> dict:
        if not pd_kwargs:
            pd_kwargs = {}
        pd_object = PerformanceUiTestModel(**data)
        return pd_object.dict(**pd_kwargs)

    @web.rpc(f'ui_performance_execution_json_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def ui_make_execution_json_config(self, integration_data: dict) -> dict:
        """ Prepare execution_json for this integration """
        return integration_data
