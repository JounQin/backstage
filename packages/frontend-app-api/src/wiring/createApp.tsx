/*
 * Copyright 2023 The Backstage Authors
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

import React, { JSX, ReactNode } from 'react';
import { ConfigReader } from '@backstage/config';
import {
  ApiBlueprint,
  AppTree,
  appTreeApiRef,
  coreExtensionData,
  FrontendFeature,
  RouteResolutionApi,
  routeResolutionApiRef,
} from '@backstage/frontend-plugin-api';
import { App } from '../extensions/App';
import { AppRoutes } from '../extensions/AppRoutes';
import { AppLayout } from '../extensions/AppLayout';
import { AppNav } from '../extensions/AppNav';
import {
  AnyApiFactory,
  ApiHolder,
  ConfigApi,
  configApiRef,
  featureFlagsApiRef,
  identityApiRef,
  errorApiRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { getAvailableFeatures } from './discovery';
import {
  ApiFactoryRegistry,
  ApiProvider,
  ApiResolver,
} from '@backstage/core-app-api';

// TODO: Get rid of all of these
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { isProtectedApp } from '../../../core-app-api/src/app/isProtectedApp';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { AppThemeProvider } from '../../../core-app-api/src/app/AppThemeProvider';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { AppIdentityProxy } from '../../../core-app-api/src/apis/implementations/IdentityApi/AppIdentityProxy';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { defaultConfigLoaderSync } from '../../../core-app-api/src/app/defaultConfigLoader';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { overrideBaseUrlConfigs } from '../../../core-app-api/src/app/overrideBaseUrlConfigs';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { resolveExtensionDefinition } from '../../../frontend-plugin-api/src/wiring/resolveExtensionDefinition';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { apis as defaultApis } from '../../../app-defaults/src/defaults';

import {
  oauthRequestDialogAppRootElement,
  alertDisplayAppRootElement,
} from '../extensions/elements';
import { extractRouteInfoFromAppNode } from '../routing/extractRouteInfoFromAppNode';

import { CreateAppRouteBinder } from '../routing';
import { RouteResolver } from '../routing/RouteResolver';
import { resolveRouteBindings } from '../routing/resolveRouteBindings';
import { collectRouteIds } from '../routing/collectRouteIds';
import { createAppTree } from '../tree';
import {
  DefaultProgressComponent,
  DefaultErrorBoundaryComponent,
  DefaultNotFoundErrorPageComponent,
} from '../extensions/components';
import { InternalAppContext } from './InternalAppContext';
import { AppRoot } from '../extensions/AppRoot';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { toInternalBackstagePlugin } from '../../../frontend-plugin-api/src/wiring/createFrontendPlugin';
// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { toInternalExtensionOverrides } from '../../../frontend-plugin-api/src/wiring/createExtensionOverrides';
import { stringifyError } from '@backstage/errors';
import { getBasePath } from '../routing/getBasePath';
import { AppThemeApi, DarkTheme, LightTheme } from '../extensions/AppThemeApi';
import { IconsApi } from '../extensions/IconsApi';
import { TranslationsApi } from '../extensions/TranslationsApi';
import { ComponentsApi } from '../extensions/ComponentsApi';
import { AppLanguageApi } from '../extensions/AppLanguageApi';
import { FeatureFlagsApi } from '../extensions/FeatureFlagsApi';

const DefaultApis = defaultApis.map(factory =>
  ApiBlueprint.make({ namespace: factory.api.id, params: { factory } }),
);

export const builtinExtensions = [
  App,
  AppRoot,
  AppRoutes,
  AppNav,
  AppLayout,
  DefaultProgressComponent,
  DefaultErrorBoundaryComponent,
  DefaultNotFoundErrorPageComponent,
  LightTheme,
  DarkTheme,
  oauthRequestDialogAppRootElement,
  alertDisplayAppRootElement,
  AppThemeApi,
  AppLanguageApi,
  IconsApi,
  TranslationsApi,
  ComponentsApi,
  FeatureFlagsApi,
  ...DefaultApis,
].map(def => resolveExtensionDefinition(def));

function deduplicateFeatures(
  allFeatures: FrontendFeature[],
): FrontendFeature[] {
  // Start by removing duplicates by reference
  const features = Array.from(new Set(allFeatures));

  // Plugins are deduplicated by ID, last one wins
  const seenIds = new Set<string>();
  return features
    .reverse()
    .filter(feature => {
      if (feature.$$type !== '@backstage/BackstagePlugin') {
        return true;
      }
      if (seenIds.has(feature.id)) {
        return false;
      }
      seenIds.add(feature.id);
      return true;
    })
    .reverse();
}

/**
 * A source of dynamically loaded frontend features.
 *
 * @public
 */
export interface CreateAppFeatureLoader {
  /**
   * Returns name of this loader. suitable for showing to users.
   */
  getLoaderName(): string;

  /**
   * Loads a number of features dynamically.
   */
  load(options: { config: ConfigApi }): Promise<{
    features: FrontendFeature[];
  }>;
}

/** @public */
export function createApp(options?: {
  features?: (FrontendFeature | CreateAppFeatureLoader)[];
  configLoader?: () => Promise<{ config: ConfigApi }>;
  bindRoutes?(context: { bind: CreateAppRouteBinder }): void;
  /**
   * The component to render while loading the app (waiting for config, features, etc)
   *
   * Is the text "Loading..." by default.
   * If set to "null" then no loading fallback component is rendered.   *
   */
  loadingComponent?: ReactNode;
}): {
  createRoot(): JSX.Element;
} {
  let suspenseFallback = options?.loadingComponent;
  if (suspenseFallback === undefined) {
    suspenseFallback = 'Loading...';
  }

  async function appLoader() {
    const config =
      (await options?.configLoader?.().then(c => c.config)) ??
      ConfigReader.fromConfigs(
        overrideBaseUrlConfigs(defaultConfigLoaderSync()),
      );

    const discoveredFeatures = getAvailableFeatures(config);

    const providedFeatures: FrontendFeature[] = [];
    for (const entry of options?.features ?? []) {
      if ('load' in entry) {
        try {
          const result = await entry.load({ config });
          providedFeatures.push(...result.features);
        } catch (e) {
          throw new Error(
            `Failed to read frontend features from loader '${entry.getLoaderName()}', ${stringifyError(
              e,
            )}`,
          );
        }
      } else {
        providedFeatures.push(entry);
      }
    }

    const app = createSpecializedApp({
      config,
      features: [...discoveredFeatures, ...providedFeatures],
      bindRoutes: options?.bindRoutes,
    }).createRoot();

    return { default: () => app };
  }

  return {
    createRoot() {
      const LazyApp = React.lazy(appLoader);
      return (
        <React.Suspense fallback={suspenseFallback}>
          <LazyApp />
        </React.Suspense>
      );
    },
  };
}

/**
 * Synchronous version of {@link createApp}, expecting all features and
 * config to have been loaded already.
 *
 * @public
 */
export function createSpecializedApp(options?: {
  features?: FrontendFeature[];
  config?: ConfigApi;
  bindRoutes?(context: { bind: CreateAppRouteBinder }): void;
}): { createRoot(): JSX.Element } {
  const {
    features: duplicatedFeatures = [],
    config = new ConfigReader({}, 'empty-config'),
  } = options ?? {};

  const features = deduplicateFeatures(duplicatedFeatures);

  const tree = createAppTree({
    features,
    builtinExtensions,
    config,
  });

  const routeInfo = extractRouteInfoFromAppNode(tree.root);
  const routeBindings = resolveRouteBindings(
    options?.bindRoutes,
    config,
    collectRouteIds(features),
  );

  const appIdentityProxy = new AppIdentityProxy();
  const apiHolder = createApiHolder(
    tree,
    config,
    appIdentityProxy,
    new RouteResolver(
      routeInfo.routePaths,
      routeInfo.routeParents,
      routeInfo.routeObjects,
      routeBindings,
      getBasePath(config),
    ),
  );

  if (isProtectedApp()) {
    const discoveryApi = apiHolder.get(discoveryApiRef);
    const errorApi = apiHolder.get(errorApiRef);
    const fetchApi = apiHolder.get(fetchApiRef);
    if (!discoveryApi || !errorApi || !fetchApi) {
      throw new Error(
        'App is running in protected mode but missing required APIs',
      );
    }
    appIdentityProxy.enableCookieAuth({
      discoveryApi,
      errorApi,
      fetchApi,
    });
  }

  const featureFlagApi = apiHolder.get(featureFlagsApiRef);
  if (featureFlagApi) {
    for (const feature of features) {
      if (feature.$$type === '@backstage/BackstagePlugin') {
        toInternalBackstagePlugin(feature).featureFlags.forEach(flag =>
          featureFlagApi.registerFlag({
            name: flag.name,
            pluginId: feature.id,
          }),
        );
      }
      if (feature.$$type === '@backstage/ExtensionOverrides') {
        toInternalExtensionOverrides(feature).featureFlags.forEach(flag =>
          featureFlagApi.registerFlag({ name: flag.name, pluginId: '' }),
        );
      }
    }
  }

  const rootEl = tree.root.instance!.getData(coreExtensionData.reactElement);

  const AppComponent = () => (
    <ApiProvider apis={apiHolder}>
      <AppThemeProvider>
        <InternalAppContext.Provider
          value={{ appIdentityProxy, routeObjects: routeInfo.routeObjects }}
        >
          {rootEl}
        </InternalAppContext.Provider>
      </AppThemeProvider>
    </ApiProvider>
  );

  return {
    createRoot() {
      return <AppComponent />;
    },
  };
}

function createApiHolder(
  tree: AppTree,
  configApi: ConfigApi,
  appIdentityProxy: AppIdentityProxy,
  routeResolutionApi: RouteResolutionApi,
): ApiHolder {
  const factoryRegistry = new ApiFactoryRegistry();

  const pluginApis =
    tree.root.edges.attachments
      .get('apis')
      ?.map(e => e.instance?.getData(ApiBlueprint.dataRefs.factory))
      .filter((x): x is AnyApiFactory => !!x) ?? [];

  for (const factory of pluginApis) {
    factoryRegistry.register('default', factory);
  }

  factoryRegistry.register('static', {
    api: identityApiRef,
    deps: {},
    factory: () => appIdentityProxy,
  });

  factoryRegistry.register('static', {
    api: appTreeApiRef,
    deps: {},
    factory: () => ({
      getTree: () => ({ tree }),
    }),
  });

  factoryRegistry.register('static', {
    api: routeResolutionApiRef,
    deps: {},
    factory: () => routeResolutionApi,
  });

  factoryRegistry.register('static', {
    api: configApiRef,
    deps: {},
    factory: () => configApi,
  });

  ApiResolver.validateFactories(factoryRegistry, factoryRegistry.getAllApis());

  return new ApiResolver(factoryRegistry);
}
