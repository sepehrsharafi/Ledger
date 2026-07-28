"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// How far the finger must travel before a press becomes a drag rather than a tap.
const DRAG_THRESHOLD = 6;
// Distance from a scroller's edge that starts auto-scrolling, and the speed.
const EDGE_ZONE = 56;
const EDGE_SPEED = 14;

/**
 * Pointer-based board dragging, for moving a card between columns.
 *
 * The HTML5 drag-and-drop API this replaces never worked on touch: `dragstart`
 * and `drop` are mouse-only, so on a phone the board was read-only. Pointer
 * Events cover mouse, touch and pen through one code path, so both platforms now
 * share the same behaviour rather than needing separate implementations.
 *
 * Two things make it usable on a narrow screen, where the columns are wider than
 * the viewport:
 *
 *  - The board scrolls while you hold a card. Dragging within `EDGE_ZONE` of
 *    either edge scrolls that way each frame, so a column that is off-screen when
 *    you pick a card up can still be reached.
 *  - Page scrolling and native long-press behaviour are suppressed only once a
 *    drag has actually begun, so a plain tap still opens the record. That needs
 *    `touch-action: none` on the handle (see `dragHandleProps`) because a browser
 *    will not let JavaScript cancel a scroll it has already started.
 *
 * Drop targets register themselves by id; the column under the pointer wins.
 */
export function useBoardDrag({ onDrop }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  const [pointer, setPointer] = useState(null);

  const scrollerRef = useRef(null);
  const columnsRef = useRef(new Map());
  const stateRef = useRef({ id: null, started: false, originX: 0, originY: 0 });
  const frameRef = useRef(0);
  const edgeRef = useRef(0);

  const registerColumn = useCallback((columnId, node) => {
    if (node) {
      columnsRef.current.set(columnId, node);
    } else {
      columnsRef.current.delete(columnId);
    }
  }, []);

  const columnAt = useCallback((x, y) => {
    for (const [columnId, node] of columnsRef.current) {
      const rect = node.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return columnId;
      }
    }
    return null;
  }, []);

  // Auto-scroll runs on its own frame loop so it keeps moving while the finger is
  // held still inside the edge zone.
  const runEdgeScroll = useCallback(() => {
    frameRef.current = 0;
    const scroller = scrollerRef.current;
    const direction = edgeRef.current;

    if (scroller && direction) {
      scroller.scrollLeft += direction * EDGE_SPEED;
      frameRef.current = requestAnimationFrame(runEdgeScroll);
    }
  }, []);

  const stopEdgeScroll = useCallback(() => {
    edgeRef.current = 0;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);

  const reset = useCallback(() => {
    stateRef.current = { id: null, started: false, originX: 0, originY: 0 };
    setDraggingId(null);
    setOverColumn(null);
    setPointer(null);
    stopEdgeScroll();
  }, [stopEdgeScroll]);

  useEffect(() => reset, [reset]);

  const onPointerDown = useCallback((cardId, event) => {
    // Ignore secondary buttons; a right-click is not a drag.
    if (event.button && event.button !== 0) {
      return;
    }
    stateRef.current = {
      id: cardId,
      started: false,
      originX: event.clientX,
      originY: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      const state = stateRef.current;
      if (!state.id) {
        return;
      }

      if (!state.started) {
        const travelled = Math.hypot(
          event.clientX - state.originX,
          event.clientY - state.originY,
        );
        if (travelled < DRAG_THRESHOLD) {
          return;
        }
        state.started = true;
        setDraggingId(state.id);
      }

      event.preventDefault();
      setPointer({ x: event.clientX, y: event.clientY });
      setOverColumn(columnAt(event.clientX, event.clientY));

      const scroller = scrollerRef.current;
      if (!scroller) {
        return;
      }

      const rect = scroller.getBoundingClientRect();
      const nearLeft = event.clientX - rect.left < EDGE_ZONE;
      const nearRight = rect.right - event.clientX < EDGE_ZONE;
      const direction = nearLeft ? -1 : nearRight ? 1 : 0;

      // Step once per move as well as running the frame loop. Moving into the edge
      // zone then scrolls on the same event that detected it, rather than waiting
      // for the next frame, and the loop only has to cover a finger held still.
      if (direction) {
        scroller.scrollLeft += direction * EDGE_SPEED;
      }

      if (direction !== edgeRef.current) {
        edgeRef.current = direction;
        if (direction && !frameRef.current) {
          frameRef.current = requestAnimationFrame(runEdgeScroll);
        }
      }
    },
    [columnAt, runEdgeScroll],
  );

  const onPointerUp = useCallback(
    (event) => {
      const state = stateRef.current;
      if (!state.id) {
        return;
      }

      if (state.started) {
        const target = columnAt(event.clientX, event.clientY);
        if (target) {
          onDrop(state.id, target);
        }
      }

      reset();
    },
    [columnAt, onDrop, reset],
  );

  return {
    draggingId,
    overColumn,
    pointer,
    /** Attach to the horizontally scrolling wrapper so edge scrolling can drive it. */
    scrollerRef,
    /** Attach to each column: `ref={registerColumn.bind(null, status)}`. */
    registerColumn,
    /**
     * Spread onto each draggable card. `touch-action: none` is what lets a drag
     * beat the browser's own scrolling — without it `preventDefault` arrives too
     * late to matter on touch.
     */
    dragHandleProps: (cardId) => ({
      onPointerDown: (event) => onPointerDown(cardId, event),
      onPointerMove,
      onPointerUp,
      onPointerCancel: reset,
      style: { touchAction: "none" },
    }),
    isDragging: Boolean(draggingId),
  };
}
