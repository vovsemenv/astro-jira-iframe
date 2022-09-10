interface PluginConfiguration {
  key: string;
  self: string;
  value: {
    enabled: string;
    endpoint: string;
    version: string;
    integrationId: string;
    testCasesPanel: string;
    launchesPanel: string;

    // did we need this one?
    issueTrackerId?: string;
  };
}

export const loadPluginConfig = async ({
  restBase,
  addonKey,
}: {
  restBase: string;
  addonKey: string;
}): Promise<PluginConfiguration["value"] | undefined> => {
  const urlConstructor = (path: string) => {
    return new URL(`${addonKey}${path}`, restBase);
  };
  let config: PluginConfiguration | undefined;
  try {
    const val = await fetch(urlConstructor("/properties/configuration"));
    if (!val.ok && val.status !== 200) {
      throw new Error("network error");
    }
    config = await val.json();
  } catch (err) {
    config = undefined;
    console.error(err)
  }

  return config?.value;
};

export const iframeId = 'inner-iframe';
export const hiddenClassName = 'hidden';

export const addIframe = (iframeSrc: string) => {
  const iframe = document.querySelector<HTMLIFrameElement>(`#${iframeId}`);
  if(!iframe) {
    console.error(`Something went wrong, element '#${iframeId}' not found` );
    return;
  }
  iframe.src = iframeSrc;
  iframe.classList.remove(hiddenClassName)
};

export type IframeTypes = "issue-tracker-testcases" | "issue-tracker-launches";

export interface IframeConfig {
  issueKey: string;
  restBase: string;
  addonKey: string;
}

export const initIframe = async (
  iframeType: IframeTypes,
  { issueKey, restBase, addonKey }: IframeConfig
) => {
  const pluginConfig = await loadPluginConfig({ restBase, addonKey });
  if (!pluginConfig) {
    //handle somehow
    return;
  }

  const allureEndpoint = pluginConfig.endpoint;

  const integrationId =
    pluginConfig.issueTrackerId || pluginConfig.integrationId;

  const integrationKeyName =
    pluginConfig.version === "4.x.x" ? "integrationId" : "issueTrackerId";

  const queryParams = new URLSearchParams({
    issueKey,
    [integrationKeyName]: integrationId,
  });

  const iframeSrc = new URL(
    `/iframe/${iframeType}?${queryParams}`,
    allureEndpoint
  );

  addIframe(iframeSrc.toString());
};
