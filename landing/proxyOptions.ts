import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read common_site_config.json from Frappe bench
const common_site_config = JSON.parse(
  readFileSync(join(__dirname, '../../../sites/common_site_config.json'), 'utf-8')
);

const { webserver_port } = common_site_config;

export default {
  '^/(app|api|assets|files|private)': {
    target: `http://127.0.0.1:${webserver_port}`,
    ws: true,
    router: function (req: any) {
      const site_name = req.headers.host.split(':')[0];
      return `http://${site_name}:${webserver_port}`;
    },
    changeOrigin: true,
  },
};
