import type { FastifyTypedInstance } from '../types/fastify-instance.ts'
import { loginRoute } from './auth/login.ts'
import { meRoute } from './auth/me.ts'
import { registerRoute } from './auth/register.ts'
import { assignFolderColorRoute } from './folders/assign-folder-color.ts'
import { createFolderRoute } from './folders/create-folder.ts'
import { getFolderRoute } from './folders/get-folder.ts'
import { listFoldersRoute } from './folders/list-folders.ts'
import { healthRoute } from './health.ts'

import { assignNoteFolderRoute } from './notes/assign-note-folder.ts'
import { createNoteRoute } from './notes/create-note.ts'
import { getNoteRoute } from './notes/get-note.ts'
import { listNotesRoute } from './notes/list-notes.ts'
import { changePasswordRoute } from './users/change-password.ts'
import { deleteAccountRoute } from './users/delete-account.ts'
import { updateProfileRoute } from './users/update-profile.ts'

export function registerRoutes(
  app: FastifyTypedInstance,
  options: { prefix: string }
) {
  const { prefix } = options

  app.register(healthRoute, { prefix })

  app.register(loginRoute, { prefix })
  app.register(registerRoute, { prefix })
  app.register(meRoute, { prefix })
  app.register(updateProfileRoute, { prefix })
  app.register(changePasswordRoute, { prefix })
  app.register(deleteAccountRoute, { prefix })

  app.register(createNoteRoute, { prefix })
  app.register(assignNoteFolderRoute, { prefix })
  app.register(getNoteRoute, { prefix })
  app.register(listNotesRoute, { prefix })

  app.register(createFolderRoute, { prefix })
  app.register(listFoldersRoute, { prefix })
  app.register(assignFolderColorRoute, { prefix })
  app.register(getFolderRoute, { prefix })
}
