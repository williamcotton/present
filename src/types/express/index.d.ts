declare namespace Express {
  export interface Response {
    renderComponent(component: import("react").ReactElement): void;
  }
}
