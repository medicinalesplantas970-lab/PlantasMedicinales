import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.NATURALAPP_SUPABASE_CONFIG || {};
const configured = Boolean(
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.projectUrl || "") &&
  /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.publishableKey || ""),
);
const client = configured
  ? createClient(config.projectUrl, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

let authUser = null;
let profile = null;
let initialization = null;

function requireClient() {
  if (!client) {
    throw new Error("Configura projectUrl y publishableKey en js/supabase-config.js para conectar NaturalApp.");
  }
  return client;
}

function raise(error) {
  if (error) throw new Error(error.message || "No se pudo completar la operación con Supabase.");
}

async function loadProfile() {
  if (!authUser) {
    profile = null;
    return null;
  }
  const { data, error } = await requireClient()
    .from("profiles")
    .select("id, display_name, role, avatar_url")
    .eq("id", authUser.id)
    .maybeSingle();
  raise(error);
  if (!data) throw new Error("No se encontró el perfil. Ejecuta el esquema Supabase y vuelve a iniciar sesión.");
  profile = {
    id: data.id,
    name: data.display_name || "Usuario",
    email: authUser.email || "",
    role: data.role || "user",
    avatar: data.avatar_url || "",
    favorites: [],
  };
  const { data: likedPlants, error: likesError } = await requireClient()
    .from("plant_likes")
    .select("plant_id")
    .eq("user_id", authUser.id);
  raise(likesError);
  profile.favorites = (likedPlants || []).map((item) => String(item.plant_id));
  return profile;
}

async function initialize() {
  if (initialization) return initialization;
  initialization = (async () => {
    const supabase = requireClient();
    const { data, error } = await supabase.auth.getSession();
    raise(error);
    authUser = data.session?.user || null;
    await loadProfile();
    return profile;
  })();
  try {
    return await initialization;
  } catch (error) {
    initialization = null;
    throw error;
  }
}

async function signIn(email, password) {
  const supabase = requireClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  raise(error);
  authUser = data.user;
  return loadProfile();
}

async function signUp(name, email, password) {
  const supabase = requireClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: new URL("index.html", location.href).toString(),
    },
  });
  raise(error);
  if (data.session && data.user) {
    authUser = data.user;
    await loadProfile();
  }
  return { signedIn: Boolean(data.session), user: data.user || null };
}

async function signOut() {
  const { error } = await requireClient().auth.signOut();
  raise(error);
  authUser = null;
  profile = null;
}

async function listPlants() {
  const supabase = requireClient();
  const [{ data: plants, error: plantsError }, { data: comments, error: commentsError }, { data: likes, error: likesError }] = await Promise.all([
    supabase.from("plants").select("id, name, image_url, description, uses, preparation, likes_count").order("name"),
    supabase.from("plant_comments").select("id, plant_id, user_id, author_name, body, created_at").order("created_at"),
    profile
      ? supabase.from("plant_likes").select("plant_id").eq("user_id", profile.id)
      : Promise.resolve({ data: [], error: null }),
  ]);
  raise(plantsError);
  raise(commentsError);
  raise(likesError);
  const likedIds = new Set((likes || []).map((like) => String(like.plant_id)));
  const commentsByPlant = new Map();
  (comments || []).forEach((comment) => {
    const group = commentsByPlant.get(comment.plant_id) || [];
    group.push({
      id: comment.id,
      userId: comment.user_id,
      name: comment.author_name,
      text: comment.body,
      createdAt: comment.created_at,
    });
    commentsByPlant.set(comment.plant_id, group);
  });
  return (plants || []).map((plant) => ({
    ...plant,
    image: plant.image_url,
    likes: Number(plant.likes_count) || 0,
    likedByMe: likedIds.has(String(plant.id)),
    comments: commentsByPlant.get(plant.id) || [],
  }));
}

async function toggleLike(plantId) {
  if (!profile) throw new Error("Inicia sesión para marcar una planta.");
  const supabase = requireClient();
  const { data: existing, error: readError } = await supabase
    .from("plant_likes")
    .select("plant_id")
    .eq("plant_id", String(plantId))
    .eq("user_id", profile.id)
    .maybeSingle();
  raise(readError);
  if (existing) {
    const { error } = await supabase.from("plant_likes").delete()
      .eq("plant_id", String(plantId)).eq("user_id", profile.id);
    raise(error);
    profile.favorites = profile.favorites.filter((id) => id !== String(plantId));
  } else {
    const { error } = await supabase.from("plant_likes").insert({ plant_id: String(plantId), user_id: profile.id });
    raise(error);
    if (!profile.favorites.includes(String(plantId))) profile.favorites.push(String(plantId));
  }
}

async function addComment(plantId, text) {
  if (!profile) throw new Error("Inicia sesión para comentar.");
  const { error } = await requireClient().from("plant_comments").insert({
    plant_id: String(plantId),
    user_id: profile.id,
    author_name: profile.name,
    body: String(text).trim(),
  });
  raise(error);
}

async function deleteComment(commentId) {
  const { error } = await requireClient().from("plant_comments").delete().eq("id", commentId);
  raise(error);
}

async function createPlant(fields) {
  const { data, error } = await requireClient().from("plants").insert(fields).select().single();
  raise(error);
  return data;
}

async function updatePlant(plantId, fields) {
  const { error } = await requireClient().from("plants").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", String(plantId));
  raise(error);
}

async function deletePlant(plantId) {
  const { error } = await requireClient().from("plants").delete().eq("id", String(plantId));
  raise(error);
}

async function uploadImage(file, folder) {
  if (!profile) throw new Error("Inicia sesión para subir una imagen.");
  if (!file || !file.type.startsWith("image/")) throw new Error("Selecciona un archivo de imagen.");
  if (file.size > 2 * 1024 * 1024) throw new Error("La imagen debe pesar menos de 2 MB.");
  if (!['avatars', 'plants'].includes(folder)) throw new Error("Carpeta de imagen no válida.");
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" })[file.type] || "img";
  const fileName = `${folder}/${folder === "avatars" ? `${profile.id}/` : ""}${crypto.randomUUID()}.${extension}`;
  const { error } = await requireClient().storage.from("naturalapp").upload(fileName, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  raise(error);
  const { data } = requireClient().storage.from("naturalapp").getPublicUrl(fileName);
  return data.publicUrl;
}

async function updateAvatar(file) {
  const avatarUrl = await uploadImage(file, "avatars");
  const { error } = await requireClient().from("profiles").update({ avatar_url: avatarUrl }).eq("id", profile.id);
  raise(error);
  profile.avatar = avatarUrl;
  return avatarUrl;
}

async function removeAvatar() {
  const oldUrl = profile?.avatar || "";
  const marker = "/storage/v1/object/public/naturalapp/";
  const markerIndex = oldUrl.indexOf(marker);
  if (markerIndex >= 0) {
    const oldPath = decodeURIComponent(oldUrl.slice(markerIndex + marker.length));
    await requireClient().storage.from("naturalapp").remove([oldPath]);
  }
  const { error } = await requireClient().from("profiles").update({ avatar_url: null }).eq("id", profile.id);
  raise(error);
  profile.avatar = "";
}

async function recordVisit(page) {
  if (!profile) return;
  const { error } = await requireClient().from("page_visits").insert({ page, user_id: profile.id });
  raise(error);
}

async function dashboardData() {
  const supabase = requireClient();
  const pages = ["inicio", "remedios", "perfil", "agregar", "dashboard"];
  const [usersResult, plantsResult, visitsResult, ...pageResults] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("plants").select("id", { count: "exact", head: true }),
    supabase.from("page_visits").select("id", { count: "exact", head: true }),
    ...pages.map((page) => supabase.from("page_visits").select("id", { count: "exact", head: true }).eq("page", page)),
  ]);
  [usersResult, plantsResult, visitsResult, ...pageResults].forEach((result) => raise(result.error));
  return {
    users: usersResult.count || 0,
    plants: plantsResult.count || 0,
    visits: visitsResult.count || 0,
    pageViews: Object.fromEntries(pages.map((page, index) => [page, pageResults[index].count || 0])),
  };
}

function subscribe(tables, callback, filterBy = {}) {
  const supabase = requireClient();
  const channel = supabase.channel(`naturalapp-${crypto.randomUUID()}`);
  tables.forEach((table) => {
    channel.on("postgres_changes", {
      event: "*",
      schema: "public",
      table,
      ...(filterBy[table] ? { filter: filterBy[table] } : {}),
    }, callback);
  });
  channel.subscribe();
  return () => { supabase.removeChannel(channel); };
}

export const NaturalStore = {
  client,
  configured,
  initialize,
  currentUser: () => profile,
  signIn,
  signUp,
  signOut,
  listPlants,
  toggleLike,
  addComment,
  deleteComment,
  createPlant,
  updatePlant,
  deletePlant,
  uploadImage,
  updateAvatar,
  removeAvatar,
  recordVisit,
  dashboardData,
  subscribe,
};
