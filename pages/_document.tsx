import Document, { Head, Main, NextScript, NextDocumentContext, AnyPageProps, PageProps } from 'next/document'
import { MuiThemeProviderProps } from '@material-ui/core/styles/MuiThemeProvider'
import { PageContext } from '../lib/getPageContext'
import React, { ComponentType } from 'react'
import flush from 'styled-jsx/server'

class MyDocument extends Document<{ muiThemeProvider: MuiThemeProviderProps }> {

  // static async getInitialProps(ctx: NextDocumentContext) {

  // }

  render() {
    const { muiThemeProvider } = this.props
    const theme = typeof muiThemeProvider.theme === 'function' ? muiThemeProvider.theme(null) : muiThemeProvider.theme
    const themeColor = theme.palette.primary.main

    return (
      <html lang="en" dir="ltr">
        <Head />
        <meta charSet="utf-8" />
        {/* Use minimum-scale=1 to enable GPU rasterization */}
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no" />
        {/* PWA primary color */}
        <meta name="theme-color" content={themeColor} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
interface PagePropsWithMuiContext extends AnyPageProps {
  pageContext: PageContext
}

// TODO: see differnce between static getInitialProps to see if is better than this approach
MyDocument.getInitialProps = ctx => {
  let pageContext: PageContext | undefined

  const page = ctx.renderPage((Component: ComponentType<PagePropsWithMuiContext>) => {
    const WrappedComponent: ComponentType<{ pageContext: PageContext } & PageProps> = props => {
      pageContext = props.pageContext
      return <Component {...props} />
    }

    return WrappedComponent
  })

  let css
  // It might be undefined, e.g. after an error.
  if (pageContext) {
    css = (pageContext as PageContext).sheetsRegistry.toString()
  }

  // const initialProps = await Document.getInitialProps(ctx)
  // return { ...initialProps }
  return {
    ...page,
    pageContext,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: (
      <React.Fragment>
        <style id="jss-server-side" dangerouslySetInnerHTML={{ __html: css as string }} />
        {flush() || null}
      </React.Fragment>
    ),
  };
}

export default MyDocument