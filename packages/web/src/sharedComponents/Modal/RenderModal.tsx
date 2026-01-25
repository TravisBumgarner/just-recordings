import { useSignals } from '@preact/signals-react/runtime'
import type { FC } from 'react'
import { activeModalSignal } from '../../signals'
import type { ConfirmationModalProps } from './components/ConfirmationModal'
import ConfirmationModal from './components/ConfirmationModal'
import type { ShareModalProps } from './components/ShareModal'
import ShareModal from './components/ShareModal'
import { MODAL_ID } from './Modal.consts'

export type ActiveModal = ConfirmationModalProps | ShareModalProps

export type ModalId = (typeof MODAL_ID)[keyof typeof MODAL_ID]

const RenderModal: FC = () => {
  useSignals()

  if (!activeModalSignal.value?.id) return null

  switch (activeModalSignal.value.id) {
    case MODAL_ID.CONFIRMATION_MODAL:
      return <ConfirmationModal {...activeModalSignal.value} />
    case MODAL_ID.SHARE_MODAL:
      return <ShareModal {...activeModalSignal.value} />
    default:
      return null
  }
}

export default RenderModal
