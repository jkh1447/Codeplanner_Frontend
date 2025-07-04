import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, ...props }, ref) => (
        <input
        type="checkbox"
        ref={ref}
        className={className}
        {...props}
        />
    )
);

Checkbox.displayName = "Checkbox";