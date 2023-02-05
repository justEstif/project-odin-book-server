import { Router } from "express";

const router = Router();

// index page
router.get("/", function(req, res) {
  var mascots = [
    { name: "Sammy", organization: "DigitalOcean", birth_year: 2012 },
    { name: "Tux", organization: "Linux", birth_year: 1996 },
    { name: "Moby Dock", organization: "Docker", birth_year: 2013 },
  ];
  var tagline =
    "No programming concept is complete without a cute animal mascot.";
  res.render("pages/index", {
    mascots: mascots,
    tagline: tagline,
  });
});

// about page
router.get("/about", function(req, res) {
  res.render("pages/about");
});

// router.route("/").get((_req, res) => {
//   res.render("views/index", { title: "Hey", message: "Hello there!" });
// });

export default router;
