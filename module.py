#!/usr/bin/python3
# coding=utf-8

#   Copyright 2021 getcarrier.io
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

""" Module """
from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import module

from tools import constants as c

from ..integrations.models.integration import IntegrationAdmin  # pylint: disable=E0611,E0401
from .models.integration_pd import IntegrationModel


class Module(module.ModuleModel):
    """ Task module """

    def __init__(self, context, descriptor):
        self.context = context
        self.descriptor = descriptor

    def init(self):
        """ Init module """
        log.info('Initializing module')
        SECTION_NAME = 'system'

        self.descriptor.init_blueprint()
        self.descriptor.init_slots()
        self.descriptor.init_rpcs()

        # # Register template slot callback
        # self.context.slot_manager.register_callback(f"integration_card_{self.descriptor.name}", render_integration_card)
        # self.context.slot_manager.register_callback(f"security_{SECTION_NAME}", render_test_toggle)

        self.context.rpc_manager.call.integrations_register_section(
            name=SECTION_NAME,
            integration_description='Manage system integrations',
            test_planner_description='Specify system integrations. You may also set integrations in <a '
                                     'href="{}">Integrations</a> '.format('/-/configuration/integrations/')
        )

        self.context.rpc_manager.call.integrations_register(
            name=self.descriptor.name,
            section=SECTION_NAME,
            settings_model=IntegrationModel,
            # integration_callback=render_integration_create_modal
        )

        # self.context.rpc_manager.register_function(
        #     partial(make_dusty_config, self.context),
        #     name=f'dusty_config_{self.descriptor.name}',
        # )
        #
        # self.context.rpc_manager.register_function(
        #     security_test_create_integration_validate,
        #     name=f'security_test_create_integration_validate_{self.descriptor.name}',
        # )

        if not IntegrationAdmin.query.filter(IntegrationAdmin.id == 1).one_or_none():
            self._create_base_s3_integration()

    def _create_base_s3_integration(self):
        integration_args = {
            "name": "s3_integration",
            "settings": {
                "access_key": c.MINIO_ACCESS,
                "secret_access_key": {
                    "from_secrets": False,
                    "value": c.MINIO_SECRET
                },
                "region_name": c.MINIO_REGION,
                "use_compatible_storage": True,
                "storage_url": c.MINIO_URL
            },
            "is_default": True,
            "section": "system",
            "config": {
                "is_shared": True,
                "name": "Carrier Minio"
            },
            "status": "success"
        }
        integration = IntegrationAdmin(**integration_args)
        integration.insert()
        log.info('Integration created: [id: %s, name: %s]', integration.id, integration.name)

    def deinit(self):  # pylint: disable=R0201
        """ De-init module """
        log.info('De-initializing')
