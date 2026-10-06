/* 弹窗管理模块 */
export const ModalModule = (function() {
  'use strict';

  function createModal(id, onOpen, onClose) {
    const modal = document.getElementById(id);
    const entry = document.getElementById(id.replace('-modal', '-entry'));
    const closeBtn = document.getElementById(id.replace('-modal', '-close'));

    if (!modal) return null;

    function open() {
      if (!modal) return;
      modal.hidden = false;
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          modal.classList.add('show');
        });
      });
      if (onOpen) onOpen();
    }

    function close() {
      if (!modal) return;
      modal.classList.remove('show');
      setTimeout(function() {
        modal.hidden = true;
      }, 300);
      if (onClose) onClose();
    }

    if (entry) {
      entry.addEventListener('click', open);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    modal.addEventListener('click', function(e) {
      if (e.target === modal) close();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal && !modal.hidden) {
        close();
      }
    });

    return {
      open,
      close,
      element: modal
    };
  }

  function init() {
    // 这个函数会在其他模块中被调用，用于创建各种弹窗
  }

  return {
    init,
    createModal
  };
})();
