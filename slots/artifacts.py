from pylon.core.tools import log, web


class Slot:
    integration_name = 's3_integration'

    @web.slot(f'artifacts_integration_content')
    def artifacts_content(self, context, slot, payload):
        if payload is None:
            payload = {}
        project_id = self.context.rpc_manager.call.project_get_id()
        integrations = context.rpc_manager.call.integrations_get_all_integrations_by_name(
            project_id,
            Slot.integration_name
        )
        with context.app.app_context():
            return self.descriptor.render_template(
                'artifacts/content.html',
                project_integrations=integrations,
            )

    @web.slot(f'artifacts_integration_scripts')
    def artifacts_scripts(self, context, slot, payload):
        with context.app.app_context():
            return self.descriptor.render_template(
                'artifacts/scripts.html',
            )
