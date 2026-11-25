"""install.sh: puts the kit in <home>/solnest/meetings-and-notes-kit without the git link, writes
the launcher, keeps the member's .env and own files on a second run, and refuses to overwrite
something that is not this kit. Offline: it installs from this copy of the repo, or from a
local archive."""
import os
import pathlib
import shutil
import subprocess
import tarfile
import tempfile
import unittest

REPO = pathlib.Path(__file__).resolve().parent.parent
BASH = shutil.which("bash")
NODE = shutil.which("node")
FAKE_ENV = "MY_OWN_SETTING=fake_test_" + "0" * 24 + "\n"   # made up, never a real key
SKIP = {".git", ".cache", "node_modules", "bin", ".update-backup", ".pytest_cache", "__pycache__", ".env"}


@unittest.skipUnless(BASH, "needs bash")
class InstallTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.home = pathlib.Path(self.tmp.name) / "home"
        self.home.mkdir()
        self.dest = self.home / "solnest" / "meetings-and-notes-kit"

    def run_install(self, script=None, stdin=None, **extra):
        env = dict(os.environ, HOME=str(self.home), **extra)
        args = [BASH, str(script)] if script else [BASH]
        return subprocess.run(args, env=env, capture_output=True, text=True, timeout=300,
                              stdin=stdin or subprocess.DEVNULL, cwd=self.tmp.name)

    def test_installs_and_a_second_run_keeps_member_files(self):
        r = self.run_install(REPO / "install.sh")
        self.assertEqual(r.returncode, 0 if NODE else 4, r.stdout + r.stderr)
        self.assertIn("[ok] files", r.stdout)
        for rel in ("scripts/servers.mjs", "VERSION", "CLAUDE.md", "bin/py", "scripts/update.py", "scripts/register.mjs",
                    "scripts/solnest_autoupdate.py", "connectors/plaud.md", ".env.example"):
            self.assertTrue((self.dest / rel).is_file(), rel)
        self.assertFalse((self.dest / ".git").exists())       # the updater refuses a git checkout
        self.assertFalse((self.dest / ".env").exists())       # this kit needs no keys
        self.assertEqual((self.dest / "VERSION").read_text(), (REPO / "VERSION").read_text())
        h = subprocess.run([str(self.dest / "bin" / "py"), str(self.dest / "scripts" / "update.py"), "--after"],
                           capture_output=True, text=True, timeout=120)
        self.assertEqual(h.returncode, 0, h.stdout + h.stderr)
        if NODE:
            self.assertIn("[ok] helpers", r.stdout)

        (self.dest / ".env").write_text(FAKE_ENV, encoding="utf-8")
        (self.dest / ".cache").mkdir()
        (self.dest / ".cache" / "live-ok").write_text("mine\n", encoding="utf-8")
        (self.dest / "my-notes.md").write_text("mine\n", encoding="utf-8")
        r = self.run_install(REPO / "install.sh")
        self.assertEqual(r.returncode, 0 if NODE else 4, r.stdout + r.stderr)
        self.assertIn("kept your own .env", r.stdout)
        self.assertEqual((self.dest / ".env").read_text(), FAKE_ENV)
        self.assertEqual((self.dest / ".cache" / "live-ok").read_text(), "mine\n")
        self.assertEqual((self.dest / "my-notes.md").read_text(), "mine\n")

        # repair from inside the installed copy: nothing is copied over itself
        r = self.run_install(self.dest / "install.sh")
        self.assertEqual(r.returncode, 0 if NODE else 4, r.stdout + r.stderr)
        self.assertIn("already here", r.stdout)
        self.assertEqual((self.dest / ".env").read_text(), FAKE_ENV)

    def test_a_source_copy_with_keys_never_leaks_them_into_the_install(self):
        src = pathlib.Path(self.tmp.name) / "clone"
        shutil.copytree(REPO, src, ignore=lambda d, names: [n for n in names if n in SKIP])
        (src / ".env").write_text("SOMEONE_ELSES=fake\n", encoding="utf-8")
        (src / ".git").mkdir()
        (src / ".cache").mkdir()
        (src / ".cache" / "live-ok").write_text("x|y\n", encoding="utf-8")
        r = self.run_install(src / "install.sh")
        self.assertEqual(r.returncode, 0 if NODE else 4, r.stdout + r.stderr)
        self.assertTrue((self.dest / "scripts" / "servers.mjs").is_file())
        for rel in (".env", ".git", ".cache"):
            self.assertFalse((self.dest / rel).exists(), rel)
        self.assertTrue((self.dest / ".env.example").is_file())

    def test_piped_install_from_an_archive(self):
        """The `curl ... | bash` path: no local repo, the kit comes from an archive."""
        archive = pathlib.Path(self.tmp.name) / "main.tar.gz"
        with tarfile.open(archive, "w:gz") as tar:
            tar.add(REPO, "solnest-meetings-and-notes-kit-main",
                    filter=lambda t: None if set(pathlib.PurePosixPath(t.name).parts) & SKIP else t)
        with open(REPO / "install.sh", "rb") as script:
            r = self.run_install(stdin=script, MEETINGS_KIT_ARCHIVE_URL=archive.as_uri())
        self.assertEqual(r.returncode, 0 if NODE else 4, r.stdout + r.stderr)
        self.assertIn("downloading the kit", r.stdout)
        self.assertTrue((self.dest / "scripts" / "servers.mjs").is_file())
        self.assertTrue((self.dest / "bin" / "py").is_file())
        self.assertEqual((self.dest / "VERSION").read_text(), (REPO / "VERSION").read_text())

    def test_refuses_a_different_kit_and_a_git_checkout(self):
        self.dest.mkdir(parents=True)
        other = "export const KIT_NAME = 'something-else';\n"
        (self.dest / "scripts").mkdir()
        (self.dest / "scripts" / "servers.mjs").write_text(other, encoding="utf-8")
        r = self.run_install(REPO / "install.sh")
        self.assertEqual(r.returncode, 3, r.stdout + r.stderr)
        self.assertEqual((self.dest / "scripts" / "servers.mjs").read_text(), other)
        self.assertFalse((self.dest / "VERSION").exists())
        shutil.rmtree(self.dest / "scripts")
        (self.dest / ".git").mkdir()
        r = self.run_install(REPO / "install.sh")
        self.assertEqual(r.returncode, 3, r.stdout + r.stderr)
        self.assertFalse((self.dest / "scripts").exists())


if __name__ == "__main__":
    unittest.main()
