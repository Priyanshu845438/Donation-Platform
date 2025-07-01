
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'ion-icon': {
                name: string;
                class?: string;
                className?: string;
                [key: string]: any;
            };
        }
    }
}

export {};
