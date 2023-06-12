const S3IntegrationArtifacts = {
    delimiters: ['[[', ']]'],
    props: ['project_integrations'],
    data() {
        return this.initialState()
    },
    computed: {
        is_local() {
            return !!(this.integration_data.project_id)
        },
    },
    methods: {
        getIntegrationTitle(integration) {
            return integration.is_default ? `${integration.config?.name} - default` : integration.config?.name
        },
        get_integration_value(integration) {
            return `${integration?.id}#${integration?.project_id}`
        },
        get_data() {
            if (this.is_selected) {
                const {selected_integration: integration_id, is_local} = this
                return {integration_id, is_local}
            }
        },
        set_data(data) {
            const {integration_id, is_local} = data
            this.$emit('set_data', {id: integration_id, is_local})
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        initialState: () => ({
        })
    },
    template: `
    <div>
        <div class="collapse pb-20">
            <div class="select-validation" 
                <select class="selectpicker bootstrap-select__b" data-style="btn"
                    v-model="selected_integration">
                    <option
                        v-for="integration in project_integrations"
                        :value="get_integration_value(integration)"
                        :title="getIntegrationTitle(integration)"
                    >
                        [[ getIntegrationTitle(integration) ]]
                    </option>
                </select>
            </div>
            
        </div>
    </div>
    `
}

register_component('s3-integration-artifacts', S3IntegrationArtifacts)
