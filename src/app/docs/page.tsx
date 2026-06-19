"use client";
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

export default function ApiReferencePage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ApiReferenceReact
        configuration={{
          spec: {
            url: '/openapi.json',
          },
        }}
      />
    </div>
  );
}
