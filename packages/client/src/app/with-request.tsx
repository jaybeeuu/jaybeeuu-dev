import { log } from "@bickley-wallace/utilities";
import { h, VNode, ComponentType, FunctionComponent } from "preact";
import { Request as Request, RequestStatus } from "../utils/request";
import { getDisplayName } from "../utils/component";

export interface OwnProps<Response> {
  request: Request<Response>
}

export interface InjectedProps<Response> {
  response: Response
}

export const withRequest = <Response, ContentProps extends {} = {}>(
  Content: ComponentType<ContentProps & InjectedProps<Response>>
): FunctionComponent<ContentProps & OwnProps<Response>> => {
  const FetchCompleteComponent = (
    { request, ...contentProps }: ContentProps & OwnProps<Response>
  ): VNode<any> => {
    if (request.status === RequestStatus.FAILED) {
      log.error("Request failed", request.error);
    }
    if (request.status !== RequestStatus.COMPLETE) {
      return (
        <pre>{JSON.stringify(request, null, 2)}</pre>
      );
    }

    const injectableContentProps = {
      ...contentProps,
      response: request.response
    };

    return (
      // TODO: Can i avoid having to cast the object above?
      // @ts-expect-error
      <Content {...injectableContentProps}/>
    );
  };

  FetchCompleteComponent.displayName = `FetchComplete(${getDisplayName(Content)})`;

  return FetchCompleteComponent;
};
