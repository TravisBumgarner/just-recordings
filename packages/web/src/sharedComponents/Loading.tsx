import { AnimatePresence, motion } from 'framer-motion'

const Loading = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        flexGrow: 1,
      }}
    >
      <AnimatePresence>
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            rotate: {
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
            },
          }}
          style={{
            width: 75,
            height: 75,
            border: `10px solid`,
            borderColor: 'divider',
          }}
        />
      </AnimatePresence>
    </div>
  )
}

export default Loading
