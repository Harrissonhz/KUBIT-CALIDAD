document.addEventListener('DOMContentLoaded', () => {
  const $footer = document.getElementById('footer');
  if (!$footer) return;

  $footer.innerHTML = `
    <footer class="bg-black text-slate-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <!-- Brand (siempre visible) -->
        <div class="flex items-center gap-2 mb-4 sm:mb-6">
          <img src="img/LogoTodasPublicaciones.jpg" alt="OutletShop" class="h-8 w-auto rounded">
          <span class="text-sm font-semibold text-white">OutletShop</span>
        </div>
        <p class="text-sm leading-relaxed mb-4 sm:mb-0 sm:hidden">Tu tienda en línea de confianza. Productos físicos y digitales con los mejores precios.</p>

        <!-- MOBILE: Acordeon -->
        <div class="sm:hidden border-t border-slate-800/60">
          <details class="group border-b border-slate-800/60">
            <summary class="flex items-center justify-between py-3 text-sm font-semibold text-white cursor-pointer list-none">
              Enlaces rápidos
              <svg class="w-4 h-4 text-slate-500 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </summary>
            <div class="accordion-content pb-3">
              <ul class="space-y-1.5 text-sm">
                <li><a href="sobre-nosotros.html" class="text-slate-400 hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="politica-privacidad.html" class="text-slate-400 hover:text-white transition-colors">Política de privacidad</a></li>
                <li><a href="terminos-condiciones.html" class="text-slate-400 hover:text-white transition-colors">Términos y condiciones</a></li>
                <li><a href="preguntas-frecuentes.html" class="text-slate-400 hover:text-white transition-colors">Preguntas frecuentes</a></li>
              </ul>
            </div>
          </details>

          <details class="group border-b border-slate-800/60">
            <summary class="flex items-center justify-between py-3 text-sm font-semibold text-white cursor-pointer list-none">
              Contacto
              <svg class="w-4 h-4 text-slate-500 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </summary>
            <div class="accordion-content pb-3">
              <ul class="space-y-2 text-sm">
                <li>
                  <a href="mailto:outletshoptiendavirtual@gmail.com" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span class="truncate">outletshoptiendavirtual@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+573054476133" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    +57 305 4476 133
                  </a>
                </li>
                <li class="flex items-center gap-2 text-slate-500">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Medellín, Colombia
                </li>
              </ul>
            </div>
          </details>
        </div>

        <!-- Social + Copyright (siempre visibles, mobile first) -->
        <div class="flex items-center justify-center gap-3 py-4 sm:py-0">
          <a href="#" class="w-10 h-10 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all" aria-label="Facebook">
            <svg class="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.35 3.24 9.35 5.47v1.99H6.85v4.57h2.5V23h5.15v-10.5h3.47l.7-4.57z"/></svg>
          </a>
          <a href="https://www.instagram.com/OutletShop_for_my/" class="w-10 h-10 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all" aria-label="Instagram">
            <svg class="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="1.5"/><circle cx="12" cy="12" r="5" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
            </a>
          <a href="#" class="w-10 h-10 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all" aria-label="TikTok">
            <svg class="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.9 2.89 2.89 0 01-2.88-2.89 2.89 2.89 0 012.88-2.89c.32 0 .62.06.92.14V9.43a6.35 6.35 0 00-.92-.07A6.34 6.34 0 004.3 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.17a8.27 8.27 0 004.02 1.36v-3.4c-.27.01-.54-.02-.81-.04z"/></svg>
          </a>
          <a href="#" class="w-10 h-10 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all" aria-label="Threads">
            <svg class="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.5 11.5c-.08 1.2-.6 2.3-1.4 3.1-1.1 1.1-2.7 1.7-4.6 1.7-1.8 0-3.4-.5-4.6-1.5-1.1-.9-1.7-2.1-1.7-3.4 0-1.2.6-2.4 1.7-3.3 1.2-1 2.7-1.5 4.5-1.5 1.8 0 3.3.5 4.5 1.5.7.6 1.2 1.3 1.5 2.1.1.3.1.6 0 .9-.1.2-.3.4-.5.4-.1 0-.3-.1-.4-.2-.1-.2-.2-.5-.3-.7-.2-.7-.7-1.3-1.3-1.7-.8-.6-1.9-.9-3.2-.9-1.4 0-2.6.4-3.5 1.2-.9.8-1.3 1.8-1.3 3 0 1.2.4 2.2 1.3 3 .9.8 2 1.2 3.4 1.2 1.2 0 2.2-.3 3-.8.5-.3.9-.7 1.2-1.2h-2.3c-.2 0-.3-.1-.4-.3-.1-.3-.1-.6 0-.9 0-.2.2-.4.4-.4h3.1c.1 0 .2.1.2.2.1.6.1 1.2 0 1.8z"/></svg>
          </a>
          <a href="#" class="w-10 h-10 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all" aria-label="YouTube">
            <svg class="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.2c-.3-1-1.1-1.8-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6c-1 .3-1.8 1.1-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1 1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6c1-.3 1.8-1.1 2.1-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5V8.5l6.3 3.5z"/></svg>
          </a>
          <a href="#" class="w-10 h-10 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all" aria-label="WhatsApp">
            <svg class="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>

        <!-- DESKTOP: Grid de 4 columnas -->
        <div class="hidden sm:grid sm:grid-cols-4 gap-8 mt-8">
          <div>
            <p class="text-sm leading-relaxed">Tu tienda en línea de confianza. Productos físicos y digitales con los mejores precios.</p>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-white mb-3">Enlaces rápidos</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="sobre-nosotros.html" class="hover:text-white transition-colors">Sobre nosotros</a></li>
              <li><a href="politica-privacidad.html" class="hover:text-white transition-colors">Política de privacidad</a></li>
              <li><a href="terminos-condiciones.html" class="hover:text-white transition-colors">Términos y condiciones</a></li>
              <li><a href="preguntas-frecuentes.html" class="hover:text-white transition-colors">Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-white mb-3">Contacto</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                outletshoptiendavirtual@gmail.com
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +57 305 4476 133
              </li>
              <li>Medellín, Colombia</li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-white mb-3">Síguenos</h4>
            <div class="flex gap-3">
              <a href="#" class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Facebook">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.35 3.24 9.35 5.47v1.99H6.85v4.57h2.5V23h5.15v-10.5h3.47l.7-4.57z"/></svg>
              </a>
              <a href="https://www.instagram.com/OutletShop_for_my/" class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Instagram">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="1.5"/><circle cx="12" cy="12" r="5" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
              </a>
              <a href="#" class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="TikTok">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.9 2.89 2.89 0 01-2.88-2.89 2.89 2.89 0 012.88-2.89c.32 0 .62.06.92.14V9.43a6.35 6.35 0 00-.92-.07A6.34 6.34 0 004.3 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.17a8.27 8.27 0 004.02 1.36v-3.4c-.27.01-.54-.02-.81-.04z"/></svg>
              </a>
              <a href="#" class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="Threads">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.5 11.5c-.08 1.2-.6 2.3-1.4 3.1-1.1 1.1-2.7 1.7-4.6 1.7-1.8 0-3.4-.5-4.6-1.5-1.1-.9-1.7-2.1-1.7-3.4 0-1.2.6-2.4 1.7-3.3 1.2-1 2.7-1.5 4.5-1.5 1.8 0 3.3.5 4.5 1.5.7.6 1.2 1.3 1.5 2.1.1.3.1.6 0 .9-.1.2-.3.4-.5.4-.1 0-.3-.1-.4-.2-.1-.2-.2-.5-.3-.7-.2-.7-.7-1.3-1.3-1.7-.8-.6-1.9-.9-3.2-.9-1.4 0-2.6.4-3.5 1.2-.9.8-1.3 1.8-1.3 3 0 1.2.4 2.2 1.3 3 .9.8 2 1.2 3.4 1.2 1.2 0 2.2-.3 3-.8.5-.3.9-.7 1.2-1.2h-2.3c-.2 0-.3-.1-.4-.3-.1-.3-.1-.6 0-.9 0-.2.2-.4.4-.4h3.1c.1 0 .2.1.2.2.1.6.1 1.2 0 1.8z"/></svg>
              </a>
              <a href="#" class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="YouTube">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.2c-.3-1-1.1-1.8-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6c-1 .3-1.8 1.1-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1 1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6c1-.3 1.8-1.1 2.1-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5V8.5l6.3 3.5z"/></svg>
              </a>
              <a href="#" class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label="WhatsApp">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-800/60 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs">
          &copy; 2026 OutletShop. Powered by <a href="index.html" class="text-white hover:underline">Kubit</a>.
        </div>
      </div>
    </footer>
  `;
});
