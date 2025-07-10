// This file declares the type for the <ion-icon> web component, making it available in JSX.
// By augmenting the global JSX namespace, we can use <ion-icon> in our TSX files without errors.

declare global {
    namespace JSX {
        interface IntrinsicElements {
            // Defines the props for the <ion-icon> element.
            // The type is simplified to avoid a dependency on the 'react' module import.
            // It explicitly types the 'name' prop and allows any other props via an index signature.
            'ion-icon': {
                name: string;
                [key: string]: any;
            };
        }
    }
}

// By adding an export, this file is treated as a module, allowing global augmentation.
export {};
