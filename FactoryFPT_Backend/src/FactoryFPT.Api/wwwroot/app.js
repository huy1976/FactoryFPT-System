const forceCtx = document.getElementById('forceChart');
const angleCtx = document.getElementById('angleChart');

const forceChart = new Chart(forceCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Force (N)',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }]
    },
    options: { animation: false }
});

const angleChart = new Chart(angleCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Angle (deg)',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
        }]
    },
    options: { animation: false }
});

let sessionId = null;

async function start() {
    const sessions = await fetch('/api/v1/sessions?page=1&pageSize=1').then(r => r.json());
    if (sessions.length) {
        sessionId = sessions[0].id;
    }

    const connection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/sensor')
        .withAutomaticReconnect()
        .build();

    connection.on('sensorBatch', batch => {
        document.getElementById('status').textContent = 'Receiving';

        batch.forEach(x => {
            const timeLabel = new Date(x.timestampUtc).toLocaleTimeString();

            forceChart.data.labels.push(timeLabel);
            forceChart.data.datasets[0].data.push(x.forceN);

            angleChart.data.labels.push(timeLabel);
            angleChart.data.datasets[0].data.push(x.angleDeg);

            document.getElementById('force').textContent = `${x.forceN.toFixed(2)} N`;
        });

        if (forceChart.data.labels.length > 300) {
            forceChart.data.labels.splice(0, 100);
            forceChart.data.datasets[0].data.splice(0, 100);
            angleChart.data.labels.splice(0, 100);
            angleChart.data.datasets[0].data.splice(0, 100);
        }

        forceChart.update();
        angleChart.update();
    });

    connection.on('alert', a => {
        const alertsElem = document.getElementById('alerts');
        const alertLog = `${new Date().toLocaleString()} ${a.code}: ${a.message}\n`;
        alertsElem.textContent = alertLog + alertsElem.textContent;
    });

    await connection.start();
    if (sessionId) {
        await connection.invoke('JoinSession', sessionId);
    }
}

start().catch(e => console.error("Lỗi kết nối Dashboard:", e));