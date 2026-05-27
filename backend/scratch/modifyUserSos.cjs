const fs = require('fs');

const path = 'frontend/src/app/sos/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('useSocket')) {
    content = content.replace(
        `import { useAuth } from '@/app/AuthProvider';`,
        `import { useAuth } from '@/app/AuthProvider';\nimport { useSocket } from '@/app/SocketProvider';`
    );
}

// Add socket hook
if (!content.includes('const { socket } = useSocket()')) {
    content = content.replace(
        `const router = useRouter();`,
        `const router = useRouter();\n    const { socket } = useSocket();`
    );
}

// Add socket listener inside useEffect
if (!content.includes('socket.on(\'new_notification\'')) {
    content = content.replace(
        `    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/sos');
        } else if (user) {
            fetchMyAlerts();
        }
    }, [user, authLoading, router]);`,
        `    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/sos');
        } else if (user) {
            fetchMyAlerts();
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNotification = (notification: any) => {
            if (notification.type === 'sos_update') {
                fetchMyAlerts();
            }
        };

        socket.on('new_notification', handleNotification);
        return () => {
            socket.off('new_notification', handleNotification);
        };
    }, [socket]);`
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Modified sos/page.tsx successfully');
