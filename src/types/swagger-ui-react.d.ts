declare module "swagger-ui-react" {
  import * as React from "react";

  export interface SwaggerUIProps {
    url?: string;
    spec?: unknown;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    deepLinking?: boolean;
    displayRequestDuration?: boolean;
    filter?: boolean | string;
    persistAuthorization?: boolean;
    tryItOutEnabled?: boolean;
    supportedSubmitMethods?: string[];
  }

  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
