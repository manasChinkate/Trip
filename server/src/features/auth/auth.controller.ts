import { prisma } from "../../../lib/prisma";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    UserSchema.parse(req.body);
  } catch (error) {
    res.status(400).json({ message: "Schema validation error", error });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const isUserExist = await prisma.user.findUnique({
      where: { email: email },
    });

    if (isUserExist) {
      return res
        .status(409)
        .json({ status: 409, message: "Email already exist" });
    }
    const user = { name, email, password: hashedPassword, role };
    const createdUser = await prisma.user.create({
      data: user,
    });
    return res.status(201).json({ status: 201, data: createdUser });
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};
