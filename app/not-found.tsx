import { Masthead, Colophon } from './_components';

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main className="shell work">
        <h1 className="work__title">お探しのページが見つかりません</h1>
        <p>
          URLが変わったか、削除された可能性があります。
          <a href="/">トップページ</a>から探してみてください。
        </p>
      </main>
      <Colophon />
    </>
  );
}
