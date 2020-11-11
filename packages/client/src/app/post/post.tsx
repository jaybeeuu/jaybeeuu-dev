import classNames from 'classnames';
import { h, FunctionComponent, JSX, createRef, render } from "preact";
import { PostMetaData } from "@bickley-wallace/compost";
import { post as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useEffect } from "preact/hooks";
import { useValue } from "../../recoilless/use-value";
import { withPromise } from "../with-promise";
import { asRoute } from "../as-route";
import { Icon } from "../icon";
import { currentPostHtml, currentPostMeta, currentPostSlug } from "../state";

import "./night-owl.css";

import css from './post.module.css';

const headingLinkSelector = "h1 a:empty, h2 a:empty, h3 a:empty, h4 a:empty, h5 a:empty, h6 a:empty";

const PostComponent = withPromise(({ postHtml, postMeta }: { postHtml: string, postMeta: PostMetaData }): JSX.Element => {
  const articleRef = createRef<HTMLElement>();

  useEffect(() => {
    const links = articleRef.current?.querySelectorAll(headingLinkSelector);
    links?.forEach((link) => {
      render(<Icon name="link"/>, link);
    });
  }, [postHtml]);

  return (
    <div className={classNames(css.element, e2eHooks.article)}>
      <div>
        <h1>{postMeta.title}</h1>
        <h5>{postMeta.lastUpdateDate ?? postMeta.publishDate}</h5>
      </div>
      <article
        ref={articleRef}
        dangerouslySetInnerHTML={{ __html: postHtml }}
      />
    </div>
  );
});

export type PostProps = { path: string, slug: string };

const Post: FunctionComponent<PostProps> = ({ slug }) => {
  const [selectedSlug, setSlug] = useValue(currentPostSlug);
  useEffect(() => {
    setSlug(slug);
  }, [slug]);

  if (!selectedSlug) {
    return null;
  }

  const postMeta = useValue(currentPostMeta);
  const postHtml = useValue(currentPostHtml);
  return <PostComponent {...{ postMeta, postHtml }} />;
};

Post.displayName = "Post";

export const PostRoute = asRoute(Post);
