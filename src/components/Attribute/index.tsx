import * as React from 'react';

export default function Attribute(props: AttributeProps) {
  return (
    <div>
      <span>{props.value}</span>
    </div>
  );
}

export interface AttributeProps {
  name: string;
  type: string;
  unit?: string;
  value?: string | number;
}
