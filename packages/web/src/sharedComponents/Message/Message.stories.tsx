import type { Meta, StoryObj } from '@storybook/react-vite'

import { fn } from 'storybook/test'

import Message from './Message'

const meta = {
  title: 'Example/Message',
  component: Message,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    message: 'This is an info message',
    color: 'info',
  },
}

export const Error: Story = {
  args: {
    message: 'This is an error message',
    color: 'error',
  },
}

export const InfoWithCallback: Story = {
  args: {
    message: 'This is an info message with a callback',
    color: 'info',
    callback: fn(),
    callbackText: 'Click me',
  },
}

export const ErrorWithCallback: Story = {
  args: {
    message: 'This is an error message with a callback',
    color: 'error',
    callback: fn(),
    callbackText: 'Click me',
  },
}
