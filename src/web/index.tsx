import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import {ConsoleLogger} from "../infrastructure/logging/ConsoleLogger";
import {LoggerService} from "../infrastructure/logging/LoggerService";
import {WebLogger} from "../infrastructure/logging/WebLogger";

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(<App />);
}

setTimeout(() => {
    if (typeof window !== 'undefined') {
        LoggerService.getInstance().setLogger(new WebLogger());
    } else {
        LoggerService.getInstance().setLogger(new ConsoleLogger());
    }
}, 100);
//To ensure that it hooks to the correct element on page
