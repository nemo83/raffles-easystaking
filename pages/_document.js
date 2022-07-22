import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="stylesheet" href="../styles/head.css" />
            </Head>
            <body className="font-sans leading-normal tracking-normal bg-black-alt">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}