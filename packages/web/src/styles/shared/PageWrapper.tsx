import { SPACING } from '../styleConsts'
import Box from '@mui/material/Box'
import type { SxProps } from '@mui/material/styles'
import React, { useMemo } from 'react'

/**
 *
 * @param width - `small | medium | full` - Specify how much horizontal screen space to take up and center if less than full.
 * @param minHeight - `boolean` - For pages with not lots of content, set a min height.
 * @param verticallyAlign - `boolean` - Used with minHeight to align content.
 * @param staticContent - `boolean` - For pages that are purely static content to add some styling to text, titles, lists, etc.
 * @returns
 */
const PageWrapper = ({
  children,
  width,
  minHeight,
  verticallyAlign,
  staticContent,
  sx,
}: {
  children: React.ReactNode
  width: 'small' | 'medium' | 'full'
  minHeight?: boolean
  verticallyAlign?: boolean
  staticContent?: boolean
  sx?: SxProps
}) => {
  const widthCSS = useMemo((): React.CSSProperties => {
    if (width === 'small') {
      return {
        width: '400px',
        maxWidth: '95%',
        margin: '0 auto',
      }
    }

    if (width === 'medium') {
      return {
        width: '600px',
        maxWidth: '95%',
        margin: '0 auto',
      }
    }

    return {}
  }, [width])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...widthCSS,
        ...(minHeight
          ? {
              minHeight: '70vh',
            }
          : {}),
        ...(verticallyAlign
          ? {
              justifyContent: 'center',
            }
          : {}),
        ...(staticContent
          ? {
              gap: SPACING.MEDIUM.PX,
              boxSizing: 'border-box',
              ul: {
                marginLeft: SPACING.LARGE.PX,
              },
            }
          : {}),
        ...(sx ? sx : {}),
      }}
    >
      {children}
    </Box>
  )
}

export default PageWrapper
