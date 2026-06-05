import type { Context, ErrorHandler } from 'hono'
import { ZodError } from 'zod'
import { HTTPException } from 'hono/http-exception'

export const errorHandler: ErrorHandler = (err, c: Context) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        message: 'Validation error',
        data: err.issues,
      },
      400
    )
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status
    )
  }

  console.error(err)

  return c.json(
    {
      success: false,
      message: 'Internal Server Error',
    },
    500
  )
}
