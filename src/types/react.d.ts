declare module "react" {
  export interface HTMLAttributes<T> {
    [key: string]: any;
  }

  export function forwardRef<T, P>(
    render: (props: P, ref: any) => ReactElement | null
  ): (props: P & { ref?: any }) => ReactElement | null;

  export type ReactElement = any;
  export function createElement(
    type: any,
    props?: any,
    ...children: any[]
  ): ReactElement;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
