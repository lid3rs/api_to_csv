module.exports = {
    apps: [
        {
            name: 'DB_Exporter',
            script: './server/server.bundle.js',
            watch: false,
            instance_var: 'INSTANCE_ID',
            env: {
                PORT: 3000,
                NODE_ENV: 'production'
            }
        }
    ]
};
