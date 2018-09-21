/// <reference types="react" />

declare module '*.json';

// Allow code to compile even when css typings haven't been generated.
declare module '*.css';

declare module '*.svg' {
  class ReactComponent extends React.Component<
    React.SVGAttributes<React.ReactSVGElement>
  > {}
  export { ReactComponent };
  const url: string;
  export default url;
}
