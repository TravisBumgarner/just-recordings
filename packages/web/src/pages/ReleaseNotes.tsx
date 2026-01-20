import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'
import { SPACING } from '@just-recordings/shared/styles'

type UpdateType = 'add' | 'update' | 'fix'
type Update = {
  title: string
  date: string
  updates: Record<UpdateType, string[]>
}

const LABELS: Record<UpdateType, string> = {
  add: 'Add',
  update: 'Update',
  fix: 'Fix',
}

const UpdateComponent = ({ title, date, updates }: Update) => {
  // Flatten updates to a single array of { type, text }
  const flatUpdates: { type: UpdateType; text: string }[] = []
  ;(['add', 'update', 'fix'] as UpdateType[]).forEach((type: UpdateType) => {
    updates[type].forEach((text: string) => {
      flatUpdates.push({ type, text })
    })
  })
  return (
    <Box>
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body2" sx={{ marginTop: SPACING.TINY.PX }}>
        <time>{date}</time>
      </Typography>
      <List>
        {flatUpdates.map((item, idx) => (
          <ListItem key={item.type + item.text + idx}>
            {LABELS[item.type]}: {item.text}
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

const UPDATES: Update[] = [
  {
    title: 'Initial Public Release',
    date: '2025-10-06',
    updates: {
      add: ['Initial release of Just Recordings'],
      update: [],
      fix: [],
    },
  },
]

const ReleaseNotes = () => {
  return (
    <PageWrapper width="full" staticContent>
      <PageTitle text="Release Notes" />
      {UPDATES.map((update) => (
        <UpdateComponent key={update.title + update.date} {...update} />
      ))}
    </PageWrapper>
  )
}

export default ReleaseNotes
