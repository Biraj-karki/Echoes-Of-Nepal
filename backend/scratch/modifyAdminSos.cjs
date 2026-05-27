const fs = require('fs');

const path = 'frontend/src/app/admin/sos/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('useSocket')) {
    content = content.replace(
        `import { Button } from '../../../components/ui/Button';`,
        `import { Button } from '../../../components/ui/Button';\nimport { useSocket } from '@/app/SocketProvider';`
    );
}

// Add socket hook
if (!content.includes('const { socket } = useSocket()')) {
    content = content.replace(
        `const [saving, setSaving] = useState<Record<number, boolean>>({});`,
        `const [saving, setSaving] = useState<Record<number, boolean>>({});\n    const { socket } = useSocket();`
    );
}

// Remove polling and add socket listener
content = content.replace(
    `    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 15000);
        return () => clearInterval(interval);
    }, []);`,
    `    useEffect(() => {
        fetchAlerts();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleAdminAlert = (notification: any) => {
            if (notification.type === 'sos_alert') {
                fetchAlerts();
            }
        };

        socket.on('admin_alert', handleAdminAlert);

        return () => {
            socket.off('admin_alert', handleAdminAlert);
        };
    }, [socket]);`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Modified admin/sos/page.tsx successfully');
