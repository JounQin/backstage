/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { lazy } from 'react';
import {
  coreExtensionData,
  createExtensionBlueprint,
  ExtensionBoundary,
  RouteRef,
} from '@backstage/frontend-plugin-api';
import { catalogExtensionData } from '../extensions';

/**
 * @alpha
 * Creates an EntityContent extension.
 */
export const EntityContentBlueprint = createExtensionBlueprint({
  kind: 'entity-content',
  attachTo: { id: 'page:catalog/entity', input: 'contents' },
  output: [
    coreExtensionData.reactElement,
    coreExtensionData.routePath,
    catalogExtensionData.entityContentTitle,
    coreExtensionData.routeRef.optional(),
    catalogExtensionData.entityFilterFunction.optional(),
    catalogExtensionData.entityFilterExpression.optional(),
  ],
  dataRefs: {
    title: catalogExtensionData.entityContentTitle,
    filterFunction: catalogExtensionData.entityFilterFunction,
    filterExpression: catalogExtensionData.entityFilterExpression,
  },
  config: {
    schema: {
      path: z => z.string().optional(),
      title: z => z.string().optional(),
      filter: z => z.string().optional(),
    },
  },
  *factory(
    {
      loader,
      defaultPath,
      defaultTitle,
      filter,
      routeRef,
    }: {
      loader: () => Promise<JSX.Element>;
      defaultPath: string;
      defaultTitle: string;
      routeRef?: RouteRef;
      filter?:
        | typeof catalogExtensionData.entityFilterFunction.T
        | typeof catalogExtensionData.entityFilterExpression.T;
    },
    { node, config },
  ) {
    const path = config.path ?? defaultPath;
    const title = config.title ?? defaultTitle;

    const ExtensionComponent = lazy(() =>
      loader().then(element => ({ default: () => element })),
    );

    yield coreExtensionData.reactElement(
      <ExtensionBoundary node={node}>
        <ExtensionComponent />
      </ExtensionBoundary>,
    );

    yield coreExtensionData.routePath(path);

    yield catalogExtensionData.entityContentTitle(title);

    if (routeRef) {
      yield coreExtensionData.routeRef(routeRef);
    }

    if (config.filter) {
      yield catalogExtensionData.entityFilterExpression(config.filter);
    } else if (typeof filter === 'string') {
      yield catalogExtensionData.entityFilterExpression(filter);
    } else if (typeof filter === 'function') {
      yield catalogExtensionData.entityFilterFunction(filter);
    }
  },
});