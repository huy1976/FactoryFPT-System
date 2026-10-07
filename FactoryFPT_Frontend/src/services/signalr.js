import * as signalR from "@microsoft/signalr";
import { CONFIG } from "../config";

export function createSensorConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(CONFIG.signalRHubUrl, {
      transport: [
        signalR.HttpTransportType.WebSockets,
        signalR.HttpTransportType.LongPolling
      ]
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}