import { registerUser, logoutUser, loginUser } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";


export async function register(req, res, next) {
    try{
        const result = registerSchema.safeParse(req.body)

        if(!result.success){
            return res.status(400).json({
                success: false,
                error:{
                    code: "validation error",
                    message: "Invalid registration data",
                    details: result.error.issues,
                },
            });
        }

        const { user, sessionToken } = await registerUser(result.data);

        res.cookie("session_token", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch(error){
        next(error);
    }
    
}

export async function logout(req, res, next) {
  try {
    await logoutUser(req.session.id);

    res.clearCookie("session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully.",
      },
    });
  } catch (error) {
    next(error);
  }
}


export async function login(req, res, next) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid login data.",
          details: result.error.issues,
        },
      });
    }

    const { user, sessionToken } = await loginUser(result.data);

    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}
