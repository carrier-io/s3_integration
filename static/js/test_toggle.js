const S3IntegrationToggle = {
    delimiters: ['[[', ']]'],
    props: ['instance_name', 'section', 'selected_integration', 'is_selected', 'integration_data'],
    emits: ['set_data', 'clear_data'],
    data() {
        return this.initialState()
    },
    computed: {
        is_local() {
            return !!(this.integration_data.project_id)
        },
    },
    methods: {
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
        <div class="security_integration_item" data-name="s3-integration-toggle"></div>
    `
}

register_component('s3-integration-toggle', S3IntegrationToggle)
