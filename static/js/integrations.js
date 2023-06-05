const S3Integration = {
    delimiters: ['[[', ']]'],
    props: ['instance_name', 'display_name', 'logo_src', 'section_name'],
    emits: ['update'],
    template: `
<div
        :id="modal_id"
        class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog"
        @dragover.prevent="modal_style = {'height': '300px', 'border': '2px dashed var(--basic)'}"
        @drop.prevent="modal_style = {'height': '100px', 'border': ''}"
>
    <ModalDialog
            v-model:name="config.name"
            v-model:is_default="is_default"
            v-model:is_shared="config.is_shared"
            @update="update"
            @create="create"
            :display_name="display_name"
            :id="id"
            :is_fetching="is_fetching"
            :is_default="is_default"
    >    
        <template #body>
            <div class="form-group">
                <p class="font-h5 font-semibold mb-1">Access Key ID</p>
                <input type="text" 
                    v-model="access_key" 
                    class="form-control form-control-alternative"
                    placeholder="Access key ID for your IAM user"
                    :class="{ 'is-invalid': error.access_key }">
                <div class="invalid-feedback">[[ error.access_key ]]</div>
                <p class="font-h5 font-semibold mb-1 mt-3">Secret Access Key </p>
                <SecretFieldInput 
                        v-model="secret_access_key"
                        placeholder="Secret access key for your IAM user"
                />
                <div class="invalid-feedback">[[ error.secret_access_key ]]</div>
                <p class="font-h5 font-semibold mb-1 mt-3">AWS Region</p>
                <input type="text" class="form-control form-control-alternative"
                    v-model="region_name"
                    placeholder="AWS region, for example: eu-central-1"
                    :class="{ 'is-invalid': error.region_name }">
                <div class="invalid-feedback">[[ error.region_name ]]</div>
                <div class="form-check-label">
                    <label class="custom-checkbox d-flex align-items-center">
                        <input type="checkbox" class="mr-2.5 mt-3"
                            v-model="use_compatible_storage"
                        >
                        <p class="font-h5 font-semibold mt-3">Use S3 compatible object store</p>
                    </label>
                    <div v-show="use_compatible_storage" class="form-group mt-0 pt-0" id="compatible_storage">
                        <label class="form-control-label font-h5 font-semibold mb-1 mt-2" for="url_for_storage">URL</label>
                            <input type="text" class="form-control form-control-alternative mt-0"
                                v-model="storage_url"
                                placeholder="URL to object store"
                                :class="{ 'is-invalid': error.storage_url }"
                            >
                            <div class="invalid-feedback">[[ error.storage_url ]]</div>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <test-connection-button
                    :apiPath="this.$root.build_api_url('integrations', 'check_settings') + '/' + pluginName"
                    :error="error.check_connection"
                    :body_data="body_data"
                    v-model:is_fetching="is_fetching"
                    @handleError="handleError"
            >
            </test-connection-button>
        </template>

    </ModalDialog>
</div>
    `,
    data() {
        return this.initialState()
    },
    mounted() {
        this.modal.on('hidden.bs.modal', e => {
            this.clear()
        })
    },
    computed: {
        project_id() {
            // return getSelectedProjectId()
            return this.$root.project_id
        },
        body_data() {
            const {
                access_key,
                secret_access_key,
                region_name,
                use_compatible_storage,
                storage_url,
                project_id,
                config,
                is_default,
                status
            } = this
            return {
                access_key,
                secret_access_key,
                region_name,
                use_compatible_storage,
                storage_url,
                project_id,
                config,
                is_default,
                status
            }
        },
        test_connection_class() {
            if (200 <= this.test_connection_status && this.test_connection_status < 300) {
                return 'btn-success'
            } else if (this.test_connection_status > 0) {
                return 'btn-warning'
            } else {
                return 'btn-secondary'
            }
        },
        modal() {
            return $(this.$el)
        },
        modal_id() {
            return `${this.instance_name}_integration`
        }
    },
    watch: {
        is_fetching(newState, oldState) {
            if (newState) {
                this.test_connection_status = 0
            }
        },
    },
    methods: {
        clear() {
            Object.assign(this.$data, this.initialState())
        },
        load(stateData) {
            Object.assign(this.$data, stateData)
        },
        handleEdit(data) {
            const {config, is_default, id, settings} = data
            this.load({...settings, config, is_default, id})
            this.modal.modal('show')
        },
        handleDelete(id) {
            this.load({id})
            this.delete()
        },
        handleSetDefault(id, local=true) {
            this.load({id})
            this.set_default(local)
        },
        create() {
            this.is_fetching = true
            fetch(this.api_url + this.pluginName, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    this.handleError(response)
                }
            })
        },
        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        errorData.forEach(item => {
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertMain.add(e, 'danger-overlay')
            }
        },
        update() {
            this.is_fetching = true
            fetch(this.api_url + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                    // alertMain.add('Jira reporter updated!', 'success-overlay')
                    // setTimeout(() => location.reload(), 1500)
                } else {
                    this.handleError(response)
                }
            })
        },
        delete() {
            this.is_fetching = true
            fetch(this.api_url + this.project_id + '/' + this.id, {
                method: 'DELETE',
            }).then(response => {
                this.is_fetching = false

                if (response.ok) {
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                    // alertMain.add('Jira integration deleted')
                    // setTimeout(() => location.reload(), 1000)
                } else {
                    this.handleError(response)
                    alertMain.add(`
                        Deletion error. 
                        <button class="btn btn-primary" 
                            onclick="vueVm.registered_components.${this.instance_name}.modal.modal('show')"
                        >
                            Open modal
                        <button>
                    `)
                }
            })
        },
        async set_default(local) {
            this.is_fetching = true
            try {
                const resp = await fetch(this.api_url + this.project_id + '/' + this.id, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({local})
                })
                if (resp.ok) {
                    this.$emit('update', {...this.$data, section_name: this.section_name})
                } else {
                    const error_data = await resp.json()
                    this.handleError(error_data)
                }
            } catch (e) {
                console.error(e)
                showNotify('ERROR', 'Error setting as default')
            } finally {
                this.is_fetching = false
            }
        },
        update_pickers() {
            $(this.$el).find('.selectpicker').selectpicker('redner').selectpicker('refresh')
        },

        initialState: () => ({
            modal_style: {'height': '100px', 'border': ''},

            access_key: '',
            secret_access_key: '',
            region_name: '',
            use_compatible_storage: false,
            storage_url: '',
            config: {},
            is_default: false,
            is_fetching: false,
            error: {},
            id: null,
            template: '',
            fileName: '',
            pluginName: 's3_integration',
            status: integration_status.success,
            api_url: V.build_api_url('integrations', 'integration') + '/',
            mode: V.mode
        })
    }
}

register_component('S3Integration', S3Integration)
