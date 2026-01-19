import React, { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export default function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {title && (
        <h2 className="text-lg font-semibold mb-3 border-b pb-2">{title}</h2>
      )}
      <div>{children}</div>
    </div>
  );
}
