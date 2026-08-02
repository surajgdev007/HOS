console.log("✅ Passport config loaded");
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    },
    
    async (payload, done) => {
      try {
        console.log("JWT Payload:", payload);

        const user = await User.findById(payload.userId).select("-password");

        console.log("User Found:", user ? user.email : "NOT FOUND");

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        console.error("JWT ERROR:", err);
        return done(err, false);
      }
    }
  )
);