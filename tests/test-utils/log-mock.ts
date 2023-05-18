let log: string[] = [];

export function getLog() {
	return log.join('\n');
}

export function resetLog() {
	log = [];
}

export function addLog(message: string) {
	log.push(message);
}
