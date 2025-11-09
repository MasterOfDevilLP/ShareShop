export async function fetchWGUsers(wid) {
  try {
    const response = await fetch(`/wg/${wid}/user`);
    if (!response.ok) throw new Error("Konnte Users nicht laden");
    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Fehler beim Laden der Users:", error);
    return [];
  }
}
