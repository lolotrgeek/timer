// Empty Function as a courtesy to DOM rendering
// Alerts happen from the state generator service and the native layer
// More performant since it cuts out react as middle man
export function useAlert() { 
    const show = () => {}
    return {show}
}